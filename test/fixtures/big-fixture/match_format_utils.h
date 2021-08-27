#pragma once

#include <string>
#include <stddef.h>

namespace match_format_utils
{
    std::string get_match_type_string(const size_t match_format);
    std::string get_local_path_string(const size_t match_format);
}
