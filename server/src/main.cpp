// main.cpp – plain-HTTP Crow server + simple Connect-4 AI + live console feed
#include "crow_all.h"
#include <vector>
#include <mutex>
#include <sstream>
#include <iostream>
#include <algorithm>
#include <unordered_map>
#include <string>

/* ────── CORS middleware ────── */
struct CORS {
    struct context {};
    void before_handle(crow::request& req, crow::response& res, context&) {
        res.add_header("Access-Control-Allow-Origin",  "*");
        res.add_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.add_header("Access-Control-Allow-Headers", "Content-Type");
        if (req.method == crow::HTTPMethod::Options) { res.code = 204; res.end(); }
    }
    void after_handle(crow::request&, crow::response&, context&) {}
};

/* ────── shared board state ────── */
static std::vector<std::vector<int>> board(6, std::vector<int>(7, 0));
static std::mutex mtx;

/* ────── search configuration ────── */
static const int MAX_DEPTH = 7;            // search depth for best_move

struct TTEntry { int depth; int score; };
static std::unordered_map<std::string, TTEntry> ttable;

/* ────── helpers ────── */
static bool is_valid(int col) { return board[0][col] == 0; }
static void drop(int col, int p) { for(int r=5;r>=0;--r) if(board[r][col]==0){ board[r][col]=p; break;} }
static void undo(int col) { for(int r=0;r<6;++r) if(board[r][col]!=0){ board[r][col]=0; break;} }

static bool four(int r,int c,int dr,int dc,int p){
    for(int k=0;k<4;k++){
        int rr=r+dr*k, cc=c+dc*k;
        if(rr<0||rr>=6||cc<0||cc>=7||board[rr][cc]!=p) return false;
    }
    return true;
}
static bool is_win(int p){
    for(int r=0;r<6;r++)for(int c=0;c<7;c++)if(board[r][c]==p)
        if(four(r,c,0,1,p)||four(r,c,1,0,p)||four(r,c,1,1,p)||four(r,c,1,-1,p)) return true;
    return false;
}

static std::string board_key(int p){
    std::string key;
    key.reserve(43);
    for(int r=0;r<6;r++)
        for(int c=0;c<7;c++)
            key.push_back('0'+board[r][c]);
    key.push_back('0'+p);
    return key;
}

/* very light heuristic */
static int eval(){
    int s=0;
    for(int r=0;r<6;r++) if(board[r][3]==1) s+=3; else if(board[r][3]==2) s-=3;

    auto score=[&](int a,int b){
        if(a&&b) return 0;
        if(a) return a==4?100:(a==3?5:1);
        if(b) return b==4?-100:(b==3?-5:-1);
        return 0;
    };
    for(int r=0;r<6;r++)for(int c=0;c<7;c++)
        for(auto [dr,dc]:std::vector<std::pair<int,int>>{{0,1},{1,0},{1,1},{1,-1}}){
            int a=0,b=0;
            for(int k=0;k<4;k++){
                int rr=r+dr*k,cc=c+dc*k;
                if(rr<0||rr>=6||cc<0||cc>=7){ a=b=-1; break; }
                if(board[rr][cc]==1) a++; else if(board[rr][cc]==2) b++;
            }
            if(a>=0) s+=score(a,b);
        }
    return s;
}

/* minimax α-β with simple transposition table */
static int search(int d,int a,int b,int p){
    auto key = board_key(p);
    auto it = ttable.find(key);
    if(it!=ttable.end() && it->second.depth>=d) return it->second.score;

    // prefer quicker wins for both players by scaling with depth
    if(is_win(1)) return 1000+d;   // larger score for faster win
    if(is_win(2)) return -1000-d;  // smaller score for faster win
    bool full=true; for(int c=0;c<7;c++) if(is_valid(c)){ full=false; break; }
    if(full||d==0) {
        int val = eval();
        ttable[key] = {d,val};
        return val;
    }

    int best;
    if(p==1){
        best=-1e9;
        for(int c:{3,2,4,1,5,0,6}) if(is_valid(c)){
            drop(c,1);
            best = std::max(best, search(d-1,a,b,2));
            undo(c);
            a = std::max(a,best); if(a>=b) break;
        }
    }else{
        best=1e9;
        for(int c:{3,2,4,1,5,0,6}) if(is_valid(c)){
            drop(c,2);
            best = std::min(best, search(d-1,a,b,1));
            undo(c);
            b = std::min(b,best); if(a>=b) break;
        }
    }
    ttable[key] = {d,best};
    return best;
}
static int best_move(int p){
    ttable.clear();
    int bestScore = (p==1? -1e9:1e9), bestCol = 3;
    for(int c:{3,2,4,1,5,0,6}) if(is_valid(c)){
        drop(c,p);
        int s = search(MAX_DEPTH,-1e9,1e9,p==1?2:1);
        undo(c);
        if((p==1 && s>bestScore)||(p==2 && s<bestScore)){ bestScore=s; bestCol=c; }
    }
    return bestCol;
}

/* ────── Crow routes ────── */
int main(){
    crow::App<CORS> app;

    /* POST /board */
    CROW_ROUTE(app,"/board").methods("POST"_method)([](const crow::request& rq){
        auto j=crow::json::load(rq.body);
        if(!j||!j["board"]) return crow::response(400,"bad JSON");

        {
            std::lock_guard<std::mutex> g(mtx);
            for(int i=0;i<6;i++)for(int j2=0;j2<7;j2++) board[i][j2]=j["board"][i][j2].i();
        }

        /* live feed */
        {
            std::lock_guard<std::mutex> g(mtx);
            std::cout<<"\n=== New board ==================\n";
            for(auto& row:board){ std::cout<<'|'; for(int c:row) std::cout<<(c? (c==1?'O':'X') :'.')<<'|'; std::cout<<'\n'; }
            int cnt1=0,cnt2=0; for(auto& row:board)for(int c:row)(c==1?cnt1:cnt2)+=(c!=0);
            int player = cnt1<=cnt2?1:2;
            std::cout<<"Next to play: Player "<<player<<(player==1?" (O)":" (X)")<<"\nThinking... "<<std::flush;
            int col = best_move(player);
            std::cout<<"best column = "<<col<<"\n";
        }
        return crow::response(200);
    });

    /* GET /show */
    CROW_ROUTE(app,"/show")([]{
        std::ostringstream os;
        std::lock_guard<std::mutex> g(mtx);
        for(auto& row:board){ os<<'|'; for(int c:row) os<<(c? (c==1?'O':'X') :'.')<<'|'; os<<'\n'; }
        return crow::response(os.str());
    });

    /* GET /move?player=1|2|auto */
    CROW_ROUTE(app,"/move")([](const crow::request& rq){
        int player;
        if(!rq.url_params.get("player") || std::string(rq.url_params.get("player"))=="auto"){
            int c1=0,c2=0; for(auto& r:board)for(int v:r)(v==1?c1:c2)+=(v!=0);
            player = c1<=c2?1:2;
        }else{
            player = std::atoi(rq.url_params.get("player"));
            if(player!=1&&player!=2) return crow::response(400,"player param must be 1,2,or auto");
        }
        std::lock_guard<std::mutex> g(mtx);
        int col = best_move(player);
        return crow::response(std::to_string(col));
    });

    app.port(8000).multithreaded().run();
    return 0;
}

