from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from extensions import db
from models.food import Food
from forms.food import FoodForm

food_bp = Blueprint('food', __name__, url_prefix='/food')

@food_bp.route('/')
@login_required
def index():
    page = request.args.get('page', 1, type=int)
    per_page = 10
    foods = Food.query.filter_by(user_id=current_user.id).order_by(Food.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return render_template('food/../templates/food/index.html', foods=foods)

@food_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    form = FoodForm()
    if form.validate_on_submit():
        food = Food(
            user_id=current_user.id,
            name=form.name.data,
            calories=form.calories.data,
            meal_time=form.meal_time.data,
            remark=form.remark.data
        )
        db.session.add(food)
        db.session.commit()
        flash('饮食记录创建成功')
        return redirect(url_for('food.index'))
    return render_template('food/../templates/food/form.html', form=form, title='新增饮食记录')

@food_bp.route('/edit/<int:id>', methods=['GET', 'POST'])
@login_required
def edit(id):
    food = Food.query.get_or_404(id)
    if food.user_id != current_user.id:
        flash('无权访问')
        return redirect(url_for('food.index'))
    form = FoodForm(obj=food)
    if form.validate_on_submit():
        food.name = form.name.data
        food.calories = form.calories.data
        food.meal_time = form.meal_time.data
        food.remark = form.remark.data
        db.session.commit()
        flash('饮食记录更新成功')
        return redirect(url_for('food.index'))
    return render_template('food/../templates/food/form.html', form=form, title='编辑饮食记录')

@food_bp.route('/delete/<int:id>')
@login_required
def delete(id):
    food = Food.query.get_or_404(id)
    if food.user_id != current_user.id:
        flash('无权访问')
        return redirect(url_for('food.index'))
    db.session.delete(food)
    db.session.commit()
    flash('饮食记录删除成功')
    return redirect(url_for('food.index'))

@food_bp.route('/view/<int:id>')
@login_required
def view(id):
    food = Food.query.get_or_404(id)
    if food.user_id != current_user.id:
        flash('无权访问')
        return redirect(url_for('food.index'))
    return render_template('food/../templates/food/view.html', food=food)