cmake_minimum_required(VERSION 3.10)
project(connect4_server)

set(CMAKE_CXX_STANDARD 17)
find_package(OpenSSL REQUIRED)

add_executable(connect4 src/main.cpp)
target_include_directories(connect4 PRIVATE src)
target_link_libraries(connect4 PRIVATE OpenSSL::SSL OpenSSL::Crypto pthread)
