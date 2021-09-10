#pragma once

#include <string_view>
#include <string>

namespace sha1
{
    std::string generate(const std::string_view input);
    std::string generate_to_hex(const std::string_view input);
}
