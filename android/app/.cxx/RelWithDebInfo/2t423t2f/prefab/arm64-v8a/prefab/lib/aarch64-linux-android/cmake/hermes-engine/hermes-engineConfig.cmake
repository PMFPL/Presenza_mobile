if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "/Users/deepak/.gradle/caches/9.3.1/transforms/27087fa7832040d5a096541f754f8ffd/transformed/jetified-hermes-android-0.14.0-release/prefab/modules/hermesvm/libs/android.arm64-v8a/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/deepak/.gradle/caches/9.3.1/transforms/27087fa7832040d5a096541f754f8ffd/transformed/jetified-hermes-android-0.14.0-release/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

