#pragma once

#include <limits>
#include <random>

class random
{
public:
    template <typename T>
    static T get()
    {
        static std::random_device seed;
        static std::default_random_engine generator(seed());
#undef max
        auto max = std::numeric_limits<T>::max();
        std::uniform_int_distribution<T> distribution(0, max);
        return distribution(generator);
    }
};
