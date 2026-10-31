import 'package:flutter/foundation.dart';
import 'package:tryeno_one/env/env.dev.dart';
import 'package:tryeno_one/env/env.prod.dart';

class Env {
  static String get apiBaseUrl => kReleaseMode ? EnvProd.apiBaseUrl : EnvDev.apiBaseUrl;
}
