import 'package:chopper/chopper.dart';
import 'package:flutter/foundation.dart';
import 'package:tryeno_one/api_generated/tryeno_one_api.swagger.dart';

/// Creates [TryenoOneApi] without editing generated `lib/api_generated/*`.
///
/// In **debug** builds only, attaches Chopper’s built-in interceptors:
/// - [HttpLoggingInterceptor] — request/response lines, headers, bodies
/// - [CurlInterceptor] — equivalent `curl` command for terminal copy-paste
///
/// Enable log output by configuring [Logger.root] in `main.dart` (see there).
TryenoOneApi createTryenoOneApi(Uri baseUrl) {
  final interceptors = <Interceptor>[];
  if (kDebugMode) {
    interceptors.addAll([
      HttpLoggingInterceptor(level: Level.body),
      CurlInterceptor(),
    ]);
  }
  return TryenoOneApi.create(
    baseUrl: baseUrl,
    interceptors: interceptors,
  );
}
