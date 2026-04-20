@ECHO OFF
REM Maven Wrapper for Windows — downloads Maven automatically.
REM Usage: mvnw.cmd <goals>

SET MAVEN_WRAPPER_PROPERTIES=.mvn\wrapper\maven-wrapper.properties

FOR /F "tokens=2 delims==" %%G IN ('findstr /R "distributionUrl" "%MAVEN_WRAPPER_PROPERTIES%"') DO SET DISTRIBUTION_URL=%%G

REM Extract version from URL (e.g. apache-maven-3.9.6)
FOR %%F IN (%DISTRIBUTION_URL%) DO SET MVN_ZIP=%%~nxF
SET MVN_VERSION=%MVN_ZIP:~0,-8%

SET MVN_HOME=%USERPROFILE%\.m2\wrapper\%MVN_VERSION%

IF NOT EXIST "%MVN_HOME%\bin\mvn.cmd" (
    ECHO Downloading %MVN_VERSION%...
    powershell -Command "Invoke-WebRequest -Uri '%DISTRIBUTION_URL%' -OutFile '%TEMP%\maven.zip'"
    powershell -Command "Expand-Archive -Path '%TEMP%\maven.zip' -DestinationPath '%USERPROFILE%\.m2\wrapper\' -Force"
)

"%MVN_HOME%\bin\mvn.cmd" %*
