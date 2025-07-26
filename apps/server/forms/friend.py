from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, DateTimeField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Length, Email, Optional

class FriendForm(FlaskForm):
    name = StringField('姓名', validators=[DataRequired(), Length(1, 50)])
    sex = SelectField('性别', choices=[(1, '男'), (2, '女')], coerce=int)
    birth_date = DateTimeField('生日', format='%Y-%m-%d', validators=[Optional()])
    birth_type = SelectField('生日类型', choices=[(1, '农历'), (2, '公历')], coerce=int)
    phone = StringField('电话', validators=[Optional(), Length(1, 20)])
    qq = StringField('QQ', validators=[Optional(), Length(1, 20)])
    wechat = StringField('微信', validators=[Optional(), Length(1, 50)])
    email = StringField('邮箱', validators=[Optional(), Email(), Length(1, 100)])
    live_address = StringField('现居地址', validators=[Optional(), Length(1, 200)])
    address = StringField('家庭住址', validators=[Optional(), Length(1, 200)])
    school = StringField('学校', validators=[Optional(), Length(1, 100)])
    disposition = StringField('性格', validators=[Optional(), Length(1, 200)])
    remark = TextAreaField('备注')
    advantage = TextAreaField('优点')
    disadvantage = TextAreaField('缺点')
    submit = SubmitField('提交')

class FriendPhoneForm(FlaskForm):
    phone = StringField('电话', validators=[DataRequired(), Length(1, 20)])
    submit = SubmitField('提交')

class FriendQQForm(FlaskForm):
    qq = StringField('QQ', validators=[DataRequired(), Length(1, 20)])
    nickname = StringField('昵称', validators=[Optional(), Length(1, 50)])
    submit = SubmitField('提交')

class FriendWechatForm(FlaskForm):
    wechat = StringField('微信', validators=[DataRequired(), Length(1, 50)])
    nickname = StringField('昵称', validators=[Optional(), Length(1, 50)])
    submit = SubmitField('提交')

class FriendEmailForm(FlaskForm):
    email = StringField('邮箱', validators=[DataRequired(), Email(), Length(1, 100)])
    submit = SubmitField('提交') 