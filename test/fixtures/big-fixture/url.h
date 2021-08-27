#pragma once

#include <string_view>
#include <tuple>

namespace url
{
    std::tuple<std::string_view, std::string_view> get_hostname_and_path(const std::string_view url);
}
