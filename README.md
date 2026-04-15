Follow this simple guide to run this application:

# Backend:

- Install anaconda3
- Create a new environment: conda create -n cashsight python=3.10 -y
- Install dependencies:
    - `conda activate cashsight`
    - `cd backend\receipt-ocr`
    - `pip install requirements.txt`
    - `pip install receipt-ocr`
    - Change to backend directory: `cd backend\receipt-ocr`
    - Run the docker container: `docker compose -f app/docker-compose.yml up` (must run before front end).

# Frontend:
- Install node and npm.
- `cd frontend`
- `npm install` then follow by `npm run dev`

# Environment variable (must do before run docker container and frontend, otherwise app won't go up):
- Create a new environment file in frontend: .env and fill in your API.
- Create a new environment file in backend\receipt-ocr\app: .env and fill in your API.

Credits:
Pham Nhat Minh and BT3103 Group 22 AY25/26 Team (pls fill your own name :D).


Backend credits:
Copyright (c) 2025 Bhimraj Yadav

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

