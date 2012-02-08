# def scale(val, src, dst):
#         """
#         Scale the given value from the scale of src to the scale of dst.
#         """
#         return ((val - src[0]) / (src[1]-src[0])) * (dst[1]-dst[0]) + dst[0]
# 

from math import log

def scale(val):
    if val <=0:
        return 0
    else:
        return (log(val)/10)


def get_inputs(venue):
	inputs = []
	inputs.append(venue['stats']['checkinsCount'])
	inputs.append(venue['hereNow']['count'])
	inputs.append(venue['stats']['tipCount'])
        # usersCount (regulars?)
        # friends here
        # number of photos    
        # categories
        
        inputs = map(scale, inputs)        

        # print 'INPUTS: ' 
        # print inputs
        return(inputs)



