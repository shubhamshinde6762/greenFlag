from flask import Blueprint

bp = Blueprint('verify', __name__)

from . import verify
