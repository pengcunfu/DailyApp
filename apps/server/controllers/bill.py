from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from extensions import db
from apps.server.models.bill import Bill, BillCategory
from forms.bill import BillForm, BillCategoryForm
from sqlalchemy import func
from datetime import datetime, timedelta

bill_bp = Blueprint('bill', __name__, url_prefix='/bill')

@bill_bp.route('/')
@login_required
def index():
    page = request.args.get('page', 1, type=int)
    per_page = 10
    
    bills = Bill.query.filter_by(
        user_id=current_user.id,
        is_deleted=False
    ).order_by(Bill.spending_time.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return render_template('bill/../templates/bill/index.html', bills=bills)

@bill_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    form = BillForm()
    form.category_id.choices = [(c.id, c.name) for c in BillCategory.query.all()]
    
    if form.validate_on_submit():
        bill = Bill(
            user_id=current_user.id,
            category_id=form.category_id.data,
            amount=form.amount.data,
            order_name=form.order_name.data,
            spending_time=form.spending_time.data
        )
        db.session.add(bill)
        db.session.commit()
        flash('账单创建成功')
        return redirect(url_for('bill.index'))
    
    return render_template('bill/../templates/bill/form.html', form=form, title='新增账单')

@bill_bp.route('/edit/<int:id>', methods=['GET', 'POST'])
@login_required
def edit(id):
    bill = Bill.query.get_or_404(id)
    if bill.user_id != current_user.id:
        flash('无权访问')
        return redirect(url_for('bill.index'))
    
    form = BillForm(obj=bill)
    form.category_id.choices = [(c.id, c.name) for c in BillCategory.query.all()]
    
    if form.validate_on_submit():
        bill.category_id = form.category_id.data
        bill.amount = form.amount.data
        bill.order_name = form.order_name.data
        bill.spending_time = form.spending_time.data
        db.session.commit()
        flash('账单更新成功')
        return redirect(url_for('bill.index'))
    
    return render_template('bill/../templates/bill/form.html', form=form, title='编辑账单')

@bill_bp.route('/delete/<int:id>')
@login_required
def delete(id):
    bill = Bill.query.get_or_404(id)
    if bill.user_id != current_user.id:
        flash('无权访问')
        return redirect(url_for('bill.index'))
    
    bill.is_deleted = True
    db.session.commit()
    flash('账单删除成功')
    return redirect(url_for('bill.index'))

@bill_bp.route('/category')
@login_required
def category_list():
    categories = BillCategory.query.all()
    return render_template('bill/../templates/bill/category_list.html', categories=categories)

@bill_bp.route('/category/create', methods=['GET', 'POST'])
@login_required
def category_create():
    form = BillCategoryForm()
    form.parent_id.choices = [(0, '无')] + [(c.id, c.name) for c in BillCategory.query.all()]
    
    if form.validate_on_submit():
        category = BillCategory(
            name=form.name.data,
            parent_id=form.parent_id.data if form.parent_id.data != 0 else None
        )
        db.session.add(category)
        db.session.commit()
        flash('分类创建成功')
        return redirect(url_for('bill.category_list'))
    
    return render_template('bill/../templates/bill/category_form.html', form=form, title='新增分类')

@bill_bp.route('/category/edit/<int:id>', methods=['GET', 'POST'])
@login_required
def category_edit(id):
    category = BillCategory.query.get_or_404(id)
    form = BillCategoryForm(obj=category)
    form.parent_id.choices = [(0, '无')] + [(c.id, c.name) for c in BillCategory.query.filter(BillCategory.id != id).all()]
    
    if form.validate_on_submit():
        category.name = form.name.data
        category.parent_id = form.parent_id.data if form.parent_id.data != 0 else None
        db.session.commit()
        flash('分类更新成功')
        return redirect(url_for('bill.category_list'))
    
    return render_template('bill/../templates/bill/category_form.html', form=form, title='编辑分类')

@bill_bp.route('/category/delete/<int:id>')
@login_required
def category_delete(id):
    category = BillCategory.query.get_or_404(id)
    if category.bills:
        flash('该分类下还有账单，无法删除')
        return redirect(url_for('bill.category_list'))
    
    db.session.delete(category)
    db.session.commit()
    flash('分类删除成功')
    return redirect(url_for('bill.category_list'))

@bill_bp.route('/statistics')
@login_required
def statistics():
    # 获取分类统计数据
    category_stats = db.session.query(
        BillCategory.name,
        func.sum(Bill.amount).label('total_amount'),
        func.count(Bill.id).label('count')
    ).join(Bill).filter(
        Bill.user_id == current_user.id,
        Bill.is_deleted == False
    ).group_by(BillCategory.name).all()
    
    # 计算总金额和百分比
    total_amount = sum(stat.total_amount for stat in category_stats)
    category_stats = [{
        'name': stat.name,
        'total_amount': float(stat.total_amount),
        'count': stat.count,
        'percentage': float(stat.total_amount) / total_amount * 100 if total_amount > 0 else 0
    } for stat in category_stats]
    
    # 准备图表数据
    category_chart_data = [{
        'name': stat['name'],
        'value': stat['total_amount']
    } for stat in category_stats]
    
    # 获取最近30天的消费数据
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    daily_stats = db.session.query(
        func.date(Bill.spending_time).label('date'),
        func.sum(Bill.amount).label('amount')
    ).filter(
        Bill.user_id == current_user.id,
        Bill.is_deleted == False,
        Bill.spending_time >= start_date,
        Bill.spending_time <= end_date
    ).group_by(func.date(Bill.spending_time)).all()
    
    # 准备时间图表数据
    dates = []
    amounts = []
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.strftime('%Y-%m-%d')
        dates.append(date_str)
        amount = next((float(stat.amount) for stat in daily_stats if stat.date.strftime('%Y-%m-%d') == date_str), 0)
        amounts.append(amount)
        current_date += timedelta(days=1)
    
    time_chart_data = {
        'dates': dates,
        'amounts': amounts
    }
    
    return render_template('bill/../templates/bill/statistics.html',
                           category_stats=category_stats,
                           category_chart_data=category_chart_data,
                           time_chart_data=time_chart_data)