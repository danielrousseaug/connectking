cmake_minimum_required(VERSION 3.10)
project(connect4_server)

# Use C++17
set(CMAKE_CXX_STANDARD 17)

# Find threading library
find_package(Threads REQUIRED)

# Define our executable (will be built as "connect4")
add_executable(connect4
    src/main.cpp
)

# Include paths for our headers:
#  - src/        → your Crow-based code
#  - external/asio/asio/include → standalone ASIO headers
target_include_directories(connect4
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/src
        ${CMAKE_CURRENT_SOURCE_DIR}/external/asio/asio/include
)

# Link against pthreads
target_link_libraries(connect4
    PRIVATE
        Threads::Threads
)
