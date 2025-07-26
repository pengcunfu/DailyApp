from flask_wtf import FlaskForm
from wtforms import StringField, DecimalField, SelectField, DateTimeField, SubmitField
from wtforms.validators import DataRequired, Length, NumberRange

class BillForm(FlaskForm):
    category_id = SelectField('分类', coerce=int, validators=[DataRequired()])
    amount = DecimalField('金额', validators=[DataRequired(), NumberRange(min=0)])
    order_name = StringField('商品名称', validators=[DataRequired(), Length(1, 200)])
    spending_time = DateTimeField('消费时间', validators=[DataRequired()], format='%Y-%m-%d %H:%M:%S')
    submit = SubmitField('提交')

class BillCategoryForm(FlaskForm):
    name = StringField('分类名称', validators=[DataRequired(), Length(1, 50)])
    parent_id = SelectField('父分类', coerce=int, default=0)
    submit = SubmitField('提交') 