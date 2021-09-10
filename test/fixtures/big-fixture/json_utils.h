#pragma once

#include <string_view>

namespace json_utils
{
    bool is_valid(const std::string_view json);
    bool is_json_quick_check(const std::string_view s);
}