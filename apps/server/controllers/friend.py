from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from extensions import db
from models.friend import Friend, FriendPhone, FriendQQ, FriendWechat, FriendEmail
from forms.friend import FriendForm, FriendPhoneForm, FriendQQForm, FriendWechatForm, FriendEmailForm

friend_bp = Blueprint('friend', __name__, url_prefix='/friend')

@friend_bp.route('/')
@login_required
def index():
    page = request.args.get('page', 1, type=int)
    per_page = 10
    
    friends = Friend.query.filter_by(
        user_id=current_user.id,
        is_deleted=False
    ).order_by(Friend.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return render_template('friend/../templates/friend/index.html', friends=friends)

@friend_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    form = FriendForm()
    if form.validate_on_submit():
        friend = Friend(
            user_id=current_user.id,
            name=form.name.data,
            sex=form.sex.data,
            birth_date=form.birth_date.data,
            birth_type=form.birth_type.data,
            phone=form.phone.data,
            qq=form.qq.data,
            wechat=form.wechat.data,
            email=form.email.data,
            live_address=form.live_address.data,
            address=form.address.data,
            school=form.school.data,
            disposition=form.disposition.data,
            remark=form.remark.data,
            advantage=form.advantage.data,
            disadvantage=form.disadvantage.data
        )
        db.session.add(friend)
        db.session.commit()
        flash('朋友创建成功')
        return redirect(url_for('friend.index'))
    
    return render_template('friend/../templates/friend/form.html', form=form, title='新增朋友')

@friend_bp.route('/edit/<int:id>', methods=['GET', 'POST'])
@login_required
def edit(id):
    friend = Friend.query.get_or_404(id)
    if friend.user_id != current_user.id:
        flash('无权访问')
        return redirect(url_for('friend.index'))
    
    form = FriendForm(obj=friend)
    if form.validate_on_submit():
        friend.name = form.name.data
        friend.sex = form.sex.data
        friend.birth_date = form.birth_date.data
        friend.birth_type = form.birth_type.data
        friend.phone = form.phone.data
        friend.qq = form.qq.data
        friend.wechat = form.wechat.data
        friend.email = form.email.data
        friend.live_address = form.live_address.data
        friend.address = form.address.data
        friend.school = form.school.data
        friend.disposition = form.disposition.data
        friend.remark = form.remark.data
        friend.advantage = form.advantage.data
        friend.disadvantage = form.disadvantage.data
        db.session.commit()
        flash('朋友信息更新成功')
        return redirect(url_for('friend.index'))
    
    return render_template('friend/../templates/friend/form.html', form=form, title='编辑朋友')

@friend_bp.route('/delete/<int:id>')
@login_required
def delete(id):
    friend = Friend.query.get_or_404(id)
    if friend.user_id != current_user.id:
        flash('无权访问')
        return redirect(url_for('friend.index'))
    
    friend.is_deleted = True
    db.session.commit()
    flash('朋友删除成功')
    return redirect(url_for('friend.index'))

@friend_bp.route('/view/<int:id>')
@login_required
def view(id):
    friend = Friend.query.get_or_404(id)
    if friend.user_id != current_user.id:
        flash('无权访问')
        return redirect(url_for('friend.index'))
    
    return render_template('friend/../templates/friend/view.html', friend=friend)