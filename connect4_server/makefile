# Makefile for the Connect4 server
# ---------------------------------
# This Makefile compiles and links the C++ HTTP server using Crow.
# It defines compiler settings, include paths, libraries, and targets.

CXX      := g++
# add -DCROW_ENABLE_SSL
CXXFLAGS := -std=c++17 -O2 -I.          # ← no -DCROW_ENABLE_SSL
LDFLAGS  := -lboost_system -lpthread    # ← no -lssl -lcrypto
TARGET   := server

# Source files and object files
SRCS := main.cpp
OBJS := $(SRCS:.cpp=.o)

# Default rule: build the server executable
all: $(TARGET)

# Link step: create the executable from object files
$(TARGET): $(OBJS)
	$(CXX) $(CXXFLAGS) -o $@ $^ $(LDFLAGS)

# Compile step: build .o from .cpp
%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

# Clean up build artifacts
clean:
	rm -f $(OBJS) $(TARGET)

# Prevent conflicts with files named 'all' or 'clean'
.PHONY: all clean
