# Makefile for the Connect4 server (portable, no SSL)
CXX      := g++
CXXFLAGS := -std=c++17 -O2 -I. -Iexternal/asio/asio/include
LDFLAGS  := -lpthread

TARGET   := server
SRCS     := main.cpp
OBJS     := $(SRCS:.cpp=.o)

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CXX) $(CXXFLAGS) -o $@ $^ $(LDFLAGS)

%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS) $(TARGET)

.PHONY: all clean
