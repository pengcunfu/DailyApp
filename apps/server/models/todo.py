from extensions import db
from datetime import datetime

class Todo(db.Model):
    __tablename__ = 'app_todo'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('sys_user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    status = db.Column(db.Integer, default=0)  # 0: 未完成, 1: 已完成
    priority = db.Column(db.Integer, default=0)  # 0: 普通, 1: 重要, 2: 紧急
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False)
    
    # 关联
    details = db.relationship('TodoDetail', backref='todo', lazy=True)

class TodoDetail(db.Model):
    __tablename__ = 'app_todo_detail'
    
    id = db.Column(db.Integer, primary_key=True)
    todo_id = db.Column(db.Integer, db.ForeignKey('app_todo.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    status = db.Column(db.Integer, default=0)  # 0: 未完成, 1: 已完成
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 