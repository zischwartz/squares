# def scale(val, src, dst):
#         """
#         Scale the given value from the scale of src to the scale of dst.
#         """
#         return ((val - src[0]) / (src[1]-src[0])) * (dst[1]-dst[0]) + dst[0]
# 

category_list = ['Arts & Entertainment', 'Colleges & Universities', 'Food', 'Great Outdoors','Nightlife Spot', 'Professional & Other Places', 'Residence', 'Shop & Service', 'Travel & Transport']
# 9 values, we'll leave 10 for no category

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
        # category converted to an input per possible cat
        # print '-------------------------------------------------------'
        cat_inputs = [0, 0, 0, 0, 0, 0, 0, 0, 0]  
        category=venue['categories'][0]['parents'][0]
        if category in category_list:
            print 'it has a category'
            # turn cat inputs at the index of category to 1 and EXTEND inputs
        else:
            cat_inputs.extend([1])
        # if category == 'Nightlife Spots':
            # print 'it was a nightlife spot'
        # usersCount (regulars?)
        # friends here
        # number of photos    
        # categories
        
        inputs = map(scale, inputs)        
        # print inputs
        return(inputs)



