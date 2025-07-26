from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from extensions import db
from models.note import Note, NoteType
from forms.note import NoteForm

note_bp = Blueprint('note', __name__, url_prefix='/note')

@note_bp.route('/')
@login_required
def index():
    page = request.args.get('page', 1, type=int)
    per_page = 10
    notes = Note.query.filter_by(user_id=current_user.id, is_deleted=False).order_by(Note.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return render_template('note/../templates/note/index.html', notes=notes)

@note_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    form = NoteForm()
    if form.validate_on_submit():
        note = Note(
            user_id=current_user.id,
            type_id=form.type_id.data,
            title=form.title.data,
            content=form.content.data
        )
        db.session.add(note)
        db.session.commit()
        flash('笔记创建成功')
        return redirect(url_for('note.index'))
    return render_template('note/../templates/note/form.html', form=form, title='新增笔记')

@note_bp.route('/edit/<int:id>', methods=['GET', 'POST'])
@login_required
def edit(id):
    note = Note.query.get_or_404(id)
    if note.user_id != current_user.id:
        flash('无权访问')
        return redirect(url_for('note.index'))
    form = NoteForm(obj=note)
    if form.validate_on_submit():
        note.type_id = form.type_id.data
        note.title = form.title.data
        note.content = form.content.data
        db.session.commit()
        flash('笔记更新成功')
        return redirect(url_for('note.index'))
    return render_template('note/../templates/note/form.html', form=form, title='编辑笔记')

@note_bp.route('/delete/<int:id>')
@login_required
def delete(id):
    note = Note.query.get_or_404(id)
    if note.user_id != current_user.id:
        flash('无权访问')
        return redirect(url_for('note.index'))
    note.is_deleted = True
    db.session.commit()
    flash('笔记删除成功')
    return redirect(url_for('note.index'))

@note_bp.route('/view/<int:id>')
@login_required
def view(id):
    note = Note.query.get_or_404(id)
    if note.user_id != current_user.id:
        flash('无权访问')
        return redirect(url_for('note.index'))
    return render_template('note/../templates/note/view.html', note=note)