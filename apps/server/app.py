from flask import Flask, render_template
from flask_login import current_user
import os
from datetime import datetime, timedelta
from extensions import db, login_manager

# 初始化Flask应用
app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///daily_app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'static/uploads')
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

# 确保上传目录存在
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# 初始化扩展
db.init_app(app)
login_manager.init_app(app)

# 注册蓝图
from controllers.auth import auth_bp
from controllers.bill import bill_bp

app.register_blueprint(auth_bp)
app.register_blueprint(bill_bp)

# 导入模型
from models.user import User
from models.bill import Bill


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@app.route('/')
def index():
    if current_user.is_authenticated:
        # 获取最近的账单
        bills = Bill.query.filter_by(
            user_id=current_user.id,
            is_deleted=False
        ).order_by(Bill.spending_time.desc()).limit(5).all()
    else:
        bills = []

    return render_template('templates/index.html', bills=bills)


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
