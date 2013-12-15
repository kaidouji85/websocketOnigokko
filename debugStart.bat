@echo off
call nvmw.bat use v0.10.12
start node-inspector
start chrome http://127.0.0.1:8080/debug?port=5858
call node --debug app.js 
pause
