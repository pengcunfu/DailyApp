from extensions import db
from datetime import datetime

class BillCategory(db.Model):
    __tablename__ = 'app_bill_category'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('app_bill_category.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 自关联
    children = db.relationship('BillCategory', backref=db.backref('parent', remote_side=[id]))

class Bill(db.Model):
    __tablename__ = 'app_bill'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('sys_user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('app_bill_category.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    order_name = db.Column(db.String(200))
    spending_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False)

    # 关系
    category = db.relationship('BillCategory', backref=db.backref('bills', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'category_id': self.category_id,
            'amount': self.amount,
            'order_name': self.order_name,
            'spending_time': self.spending_time.strftime('%Y-%m-%d %H:%M:%S'),
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
            'is_deleted': self.is_deleted
        } 