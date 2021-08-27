#pragma once

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C"
{
#endif
    int validate_license_impl(const uint8_t* data, size_t size, const char* application_id);
    int validate_license_auto_impl(const char* application_id);
#ifdef __cplusplus
}
#endif
