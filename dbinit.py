from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import JSON

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)



class machine(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    reference = db.Column(db.Integer)
    line = db.Column(db.Integer)
    row = db.Column(db.Integer)
    MaState = db.relationship('machine_state', backref='machine')


class machine_state(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    date = db.Column(db.Date)
    State = db.Column(db.Boolean)
    Machine = db.Column(db.Integer,db.ForeignKey('machine.id'))
    Problem = db.Column(db.Integer, db.ForeignKey('problem.id'))


class problem(db.Model):
    id = db.Column(db.Integer,primary_key=True)
    Tampon = db.Column(db.Boolean)
    Visual = db.Column(db.Boolean)
    Measurement = db.Column(db.Boolean)
    Procedure = db.Column(db.Boolean)

    Note = db.Column(db.String(100))

    MState = db.relationship('machine_state', backref='problem')

def setState(reference,state,date):
    print(state)
    id = machine.query.filter_by(reference=reference).first().id
    mach_state = machine_state.query.filter_by(Machine=id,date=date).first()
    mach_state.State = state
    db.session.commit()


def setNote(line,row,note,date):
    mach_id = machine.query.filter_by(line=line,row=row).first().id
    problem_id = machine_state.query.filter_by(Machine=mach_id,date=date).first().problem.id
    problem.query.filter_by(id=problem_id).first().Note = note
    db.session.commit()
    return machine_state.query.filter_by(Machine=mach_id,date=date).first().State



def daily_db_creation(datenow,machines):
    datenow = datetime.strptime(datenow,'%Y-%m-%d')
    for mach in machines:
        prob = problem(Tampon=False,Visual=False,Measurement=False,Procedure=False)
        db.session.add(prob)
        db.session.commit()
        
        new_state = machine_state(date=datenow,Machine=mach.id,Problem=prob.id)
        db.session.add(new_state)
        db.session.commit()
    return 0