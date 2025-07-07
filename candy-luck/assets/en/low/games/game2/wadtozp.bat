@echo off

REM Поиск и архивация всех файлов с расширением .wad.xml
for /r %%f in (*.wad.xml) do (
    REM Получаем имя файла без полного пути и расширения, удаляя .wad.xml
    setlocal enabledelayedexpansion
    set "filename=%%~nf"
    set "filename=!filename:.wad=!"

    REM Удаляем старый архив, если существует
    if exist "!filename!.zip" del "!filename!.zip"

    REM Создаем новый архив через PowerShell
    powershell -Command "Compress-Archive -Path '%%f' -DestinationPath '!filename!.zip' -Force"
    echo Архив создан: !filename!.zip
    endlocal
)

echo Все файлы обработаны.
pause
