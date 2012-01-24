


def get_inputs(venue):
	inputs = []
	inputs.append(venue['stats']['checkinsCount'])
	inputs.append(venue['hereNow']['count'])
	inputs.append(venue['stats']['tipCount'])
	return(inputs)



class sillystring(str):
    def __init__(self):
        self.content = ''
    def write(self, content):
        self.content = content

