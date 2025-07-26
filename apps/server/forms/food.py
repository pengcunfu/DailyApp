from flask_wtf import FlaskForm
from wtforms import StringField, DecimalField, DateTimeField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Length, Optional, NumberRange

class FoodForm(FlaskForm):
    name = StringField('食物名称', validators=[DataRequired(), Length(1, 100)])
    calories = DecimalField('热量(千卡)', validators=[Optional(), NumberRange(min=0)])
    meal_time = DateTimeField('用餐时间', format='%Y-%m-%d %H:%M:%S', validators=[DataRequired()])
    remark = TextAreaField('备注', validators=[Optional()])
    submit = SubmitField('提交') 