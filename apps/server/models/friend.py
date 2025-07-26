from extensions import db
from datetime import datetime

class Friend(db.Model):
    __tablename__ = 'app_friend'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('sys_user.id'), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    sex = db.Column(db.Integer)  # 1: 男, 2: 女
    birth_date = db.Column(db.DateTime)
    birth_type = db.Column(db.Integer)  # 1: 农历, 2: 公历
    avatar = db.Column(db.String(200))
    phone = db.Column(db.String(20))
    qq = db.Column(db.String(20))
    wechat = db.Column(db.String(50))
    email = db.Column(db.String(100))
    live_address = db.Column(db.String(200))
    address = db.Column(db.String(200))
    school = db.Column(db.String(100))
    disposition = db.Column(db.String(200))
    remark = db.Column(db.Text)
    advantage = db.Column(db.Text)
    disadvantage = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False)
    
    # 关联
    phones = db.relationship('FriendPhone', backref='friend', lazy=True)
    qqs = db.relationship('FriendQQ', backref='friend', lazy=True)
    wechats = db.relationship('FriendWechat', backref='friend', lazy=True)
    emails = db.relationship('FriendEmail', backref='friend', lazy=True)

class FriendPhone(db.Model):
    __tablename__ = 'app_friend_phone'
    
    id = db.Column(db.Integer, primary_key=True)
    friend_id = db.Column(db.Integer, db.ForeignKey('app_friend.id'), nullable=False)
    phone = db.Column(db.String(20), nullable=False)

class FriendQQ(db.Model):
    __tablename__ = 'app_friend_qq'
    
    id = db.Column(db.Integer, primary_key=True)
    friend_id = db.Column(db.Integer, db.ForeignKey('app_friend.id'), nullable=False)
    qq = db.Column(db.String(20), nullable=False)
    nickname = db.Column(db.String(50))
    avatar = db.Column(db.String(200))

class FriendWechat(db.Model):
    __tablename__ = 'app_friend_wechat'
    
    id = db.Column(db.Integer, primary_key=True)
    friend_id = db.Column(db.Integer, db.ForeignKey('app_friend.id'), nullable=False)
    wechat = db.Column(db.String(50), nullable=False)
    nickname = db.Column(db.String(50))
    avatar = db.Column(db.String(200))

class FriendEmail(db.Model):
    __tablename__ = 'app_friend_email'
    
    id = db.Column(db.Integer, primary_key=True)
    friend_id = db.Column(db.Integer, db.ForeignKey('app_friend.id'), nullable=False)
    email = db.Column(db.String(100), nullable=False) 