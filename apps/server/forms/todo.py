from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, DateTimeField, SelectField, SubmitField
from wtforms.validators import DataRequired, Length, Optional

class TodoForm(FlaskForm):
    title = StringField('标题', validators=[DataRequired(), Length(1, 200)])
    content = TextAreaField('内容', validators=[Optional()])
    start_time = DateTimeField('开始时间', format='%Y-%m-%d %H:%M:%S', validators=[Optional()])
    end_time = DateTimeField('结束时间', format='%Y-%m-%d %H:%M:%S', validators=[Optional()])
    status = SelectField('状态', choices=[(0, '未完成'), (1, '已完成')], coerce=int, default=0)
    priority = SelectField('优先级', choices=[(0, '普通'), (1, '重要'), (2, '紧急')], coerce=int, default=0)
    submit = SubmitField('提交') 