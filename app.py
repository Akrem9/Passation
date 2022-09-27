from markupsafe import escape
from flask import Flask,render_template,session,redirect,url_for,request
from flask_session import Session
from flask_socketio import SocketIO, emit, send
from flask_bootstrap import Bootstrap
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, DateField, SelectField
from wtforms.validators import InputRequired, Email, Length
from flask_sqlalchemy import SQLAlchemy
from dbinit import *
from flask import flash
from flask_mail import Mail,Message
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime



app = Flask(__name__)
app.config['DEBUG'] = True
app.config['SECRET_KEY'] = 'mysecret'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SESSION_TYPE'] = 'filesystem'
sess = Session(app)
socketio = SocketIO(app,manage_session=False)
db = SQLAlchemy(app)



@app.route('/',methods=['POST','GET'])
def index():
    if verify_session():
        return render_template('Dashboard.html')
    else:
        return redirect(url_for('Verification'))

class LoginForm(FlaskForm):
    password = PasswordField('password',validators=[InputRequired(),Length(min=8,max=40)])


@socketio.on('updateNote')
def updateNote(data):
    try:
        print(data)
        line=int(data['line'])
        row=int(data['row'])
        note=data['content']
        datenow = str(datetime.now().year).zfill(4) + '-' + str(datetime.now().month).zfill(2) + '-' + str(datetime.now().day).zfill(2)
        State = setNote(line,row,note,datenow)
        socketio.emit('updateNote',{'content':note,'line':line,'row':row,'state':State})
    except:
        return  0
@socketio.on('stateChange')
def stateChange(data):
        try:
            reference = data['reference']
            state = data['state']
            datenow = str(datetime.now().year).zfill(4) + '-' + str(datetime.now().month).zfill(2) + '-' + str(datetime.now().day).zfill(2)

            setState(reference,state,datenow)
            socketio.emit('updateState',{'reference':reference,'state':state,'line':data['line'],'row':data['row']})
        except:
            pass

@socketio.on('connect')
def onConnect():
    SockID = request.sid


@socketio.on('bootRequest')
def bootRequest():
    datenow = str(datetime.now().year).zfill(4) + '-' + str(datetime.now().month).zfill(2) + '-' + str(datetime.now().day).zfill(2)


    machines_state = machine_state.query.filter_by(date=datenow).all()
    machines = machine.query.all()

    if len(machines_state) == 0:
        daily_db_creation(datenow,machines)

    dataStream = {}
    for mach in machines:
        mach_state = machine_state.query.filter_by(Machine = mach.id,date=datenow ).first()
        pr = problem.query.filter_by(id = mach_state.Problem).first()
        print(mach_state.State)
        dataStream[str(mach.line)+','+str(mach.row)] = {'Reference':mach.reference,'State':mach_state.State,'Note':pr.Note,'Tampon':pr.Tampon,'Measurement':pr.Measurement,'Procedure':pr.Procedure,'Visual':pr.Visual}

    emit('bootData',dataStream)



@app.route('/Verification',methods=['POST','GET'])
def Verification():
    if verify_session():
        return redirect(url_for('index'))
    else:
        form = LoginForm()
        if form.validate_on_submit():
            password = request.form.get('password')
            print(password)
            if password == 'STAAMP8279':
                session['id'] = 1
                return redirect(url_for('index'))
            else:
                flash('verifier le mot de passe')
    return render_template('Verification.html',form=form)







def verify_session():
    if 'id' in session:
        #print(session)
        return True
    else:
        return False
if __name__ == '__main__':
    socketio.run(app,port=5004)