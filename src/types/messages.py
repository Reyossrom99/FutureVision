"""
    Creates predined messages that would be send from all part of the application
"""
PREDEFINED_MESSAGES = {
    "sucess": {"message": "200"},
    "error": {"message": "500"}, #error in try/catch operation // backend error operation
    "invalid": {"message": "300"}, #error in invalid input
}

def get_predefined_message(key):
    return PREDEFINED_MESSAGES.get(key, {"message": "100"}) #if not key found returns error 100 -> no message found