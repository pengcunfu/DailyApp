from extensions import db
from datetime import datetime

class NoteType(db.Model):
    __tablename__ = 'app_note_type'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Note(db.Model):
    __tablename__ = 'app_note'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('sys_user.id'), nullable=False)
    type_id = db.Column(db.Integer, db.ForeignKey('app_note_type.id'))
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False)
    
    # 关联
    type = db.relationship('NoteType', backref='notes')
    attrs = db.relationship('NoteAttr', backref='note', lazy=True)

class NoteAttr(db.Model):
    __tablename__ = 'app_note_attr'
    
    id = db.Column(db.Integer, primary_key=True)
    note_id = db.Column(db.Integer, db.ForeignKey('app_note.id'), nullable=False)
    key = db.Column(db.String(50), nullable=False)
    value = db.Column(db.Text) 