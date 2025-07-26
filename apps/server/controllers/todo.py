from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from extensions import db
from models.todo import Todo
from forms.todo import TodoForm

todo_bp = Blueprint('todo', __name__, url_prefix='/todo')

@todo_bp.route('/')
@login_required
def index():
    page = request.args.get('page', 1, type=int)
    per_page = 10
    todos = Todo.query.filter_by(user_id=current_user.id, is_deleted=False).order_by(Todo.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return render_template('todo/../templates/todo/index.html', todos=todos)

@todo_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    form = TodoForm()
    if form.validate_on_submit():
        todo = Todo(
            user_id=current_user.id,
            title=form.title.data,
            content=form.content.data,
            start_time=form.start_time.data,
            end_time=form.end_time.data,
            status=form.status.data,
            priority=form.priority.data
        )
        db.session.add(todo)
        db.session.commit()
        flash('待办事项创建成功')
        return redirect(url_for('todo.index'))
    return render_template('todo/../templates/todo/form.html', form=form, title='新增待办事项')

@todo_bp.route('/edit/<int:id>', methods=['GET', 'POST'])
@login_required
def edit(id):
    todo = Todo.query.get_or_404(id)
    if todo.user_id != current_user.id:
        flash('无权访问')
        return redirect(url_for('todo.index'))
    form = TodoForm(obj=todo)
    if form.validate_on_submit():
        todo.title = form.title.data
        todo.content = form.content.data
        todo.start_time = form.start_time.data
        todo.end_time = form.end_time.data
        todo.status = form.status.data
        todo.priority = form.priority.data
        db.session.commit()
        flash('待办事项更新成功')
        return redirect(url_for('todo.index'))
    return render_template('todo/../templates/todo/form.html', form=form, title='编辑待办事项')

@todo_bp.route('/delete/<int:id>')
@login_required
def delete(id):
    todo = Todo.query.get_or_404(id)
    if todo.user_id != current_user.id:
        flash('无权访问')
        return redirect(url_for('todo.index'))
    todo.is_deleted = True
    db.session.commit()
    flash('待办事项删除成功')
    return redirect(url_for('todo.index'))

@todo_bp.route('/view/<int:id>')
@login_required
def view(id):
    todo = Todo.query.get_or_404(id)
    if todo.user_id != current_user.id:
        flash('无权访问')
        return redirect(url_for('todo.index'))
    return render_template('todo/../templates/todo/view.html', todo=todo)