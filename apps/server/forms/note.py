from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SelectField, SubmitField
from wtforms.validators import DataRequired, Length, Optional
from models.note import NoteType

class NoteForm(FlaskForm):
    type_id = SelectField('类型', coerce=int, validators=[Optional()])
    title = StringField('标题', validators=[DataRequired(), Length(1, 200)])
    content = TextAreaField('内容', validators=[Optional()])
    submit = SubmitField('提交') 