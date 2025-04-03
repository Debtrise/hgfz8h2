#!/bin/bash

APP_DIR="/opt/call-center-app"

case "$1" in
    start)
        echo "Starting application..."
        cd $APP_DIR/backend
        pm2 start src/server.js --name "call-center-backend"
        cd $APP_DIR/frontend
        pm2 start build --name "call-center-frontend" --spa
        ;;
    stop)
        echo "Stopping application..."
        pm2 stop call-center-backend call-center-frontend
        ;;
    restart)
        echo "Restarting application..."
        pm2 restart call-center-backend call-center-frontend
        ;;
    status)
        echo "Application status:"
        pm2 status
        ;;
    logs)
        echo "Showing logs..."
        pm2 logs
        ;;
    update)
        echo "Updating application..."
        cd $APP_DIR
        git pull
        cd frontend
        npm install
        npm run build
        cd ../backend
        npm install
        pm2 restart all
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|update}"
        exit 1
        ;;
esac

exit 0 