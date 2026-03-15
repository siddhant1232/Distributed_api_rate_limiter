#Distributed API Rate Limiter

This is a distributed API rate limiter built using Node.js, Express, and Redis.

The goal of this project is to protect APIs from too many requests. It limits how many requests a user or IP address can send within a certain time.

Redis is used as a shared storage so the rate limiter works even when the API is running on multiple servers or containers.

This makes the project useful for scalable backend systems and microservices.
