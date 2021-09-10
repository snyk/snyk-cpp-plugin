#pragma once

#include <string>
#include <vector>

namespace sideload
{
    bool has_sideload_support(const std::string& url);
    std::vector<std::string> get_sideload_urls(const std::string& url);
} // namespace sideload