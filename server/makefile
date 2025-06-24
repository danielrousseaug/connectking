# Simple Makefile for ConnectKing C++ server
CXX      := g++
CXXFLAGS := -std=c++17 -O2 -Isrc
LDFLAGS  := -lboost_system -lpthread -lssl -lcrypto
TARGET   := connect4

SRCS := src/main.cpp
OBJS := $(SRCS:.cpp=.o)

all: $(TARGET)

$(TARGET): $(OBJS)
$(CXX) $(CXXFLAGS) -o $@ $^ $(LDFLAGS)

%.o: %.cpp
$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
rm -f $(OBJS) $(TARGET)

.PHONY: all clean
