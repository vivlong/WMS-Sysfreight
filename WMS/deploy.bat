@echo on
set target="\\192.168.0.230\wwwroot\app\wms\sysfreight"
xcopy /y/e/s www %target%\www

pause

copy /y index.html %target%
copy /y update.json %target%
copy /y WMS.apk %target%\WMS.apk
del WMS.apk /f /q

pause 