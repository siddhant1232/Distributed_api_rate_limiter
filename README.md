# Distributed API Rate Limiter

This is a distributed API rate limiter built using Node.js, Express, and Redis.

The goal of this project is to protect APIs from too many requests. It limits how many requests a user or IP address can send within a certain time.

Redis is used as a shared storage so the rate limiter works even when the API is running on multiple servers or containers.

This makes the project useful for scalable backend systems and microservices.
<<<<<<< HEAD
=======

# System Architecture

The project is organized in a simple and modular way, so each part has a clear job.

Controllers

Controllers receive HTTP requests and send responses back to the client.

Middleware

The rate limiter is implemented as Express middleware.
This means it runs before the request reaches the main logic.

This allows us to:

Apply rate limits to all routes

Protect specific endpoints

Reuse the limiter easily

Redis

Redis is used to store request counters and token buckets.

Since Redis is shared, the rate limiter works correctly even if the API runs on multiple servers.

# Algorithms

The rate limiting logic is separated into different modules.
This makes it easy to use different algorithms for different routes.

Rate Limiting Algorithms
Fixed Window Counter

This is a simple rate-limiting method.

A counter tracks how many requests a user makes.

The counter resets after a fixed time (for example, 1 minute).

If the limit is exceeded, the request is blocked.

Pros

Easy to implement

Uses little memory

Limitation

Users may send many requests at the end of one time window and again at the start of the next window.

Token Bucket

Tokens are added to a bucket at a constant rate. Each request removes a token. If the bucket is empty, the request is dropped.

This allows for bursts of traffic while enforcing a steady average rate. It is implemented using Lua scripts in Redis to guarantee atomicity and prevent race conditions.

Sliding Window Log

The Sliding Window algorithm is an improvement over the Fixed Window. It perfectly balances out traffic bursts near the edge of time window gaps.

It uses Redis Sorted Sets (`ZSET`) to store a log of request timestamps.

When a new request arrives, it removes all timestamps older than the current window, adds the new timestamp, and counts the size of the set. This ensures highly accurate rate-limiting at scale.

