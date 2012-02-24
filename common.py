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
        return (log(val)) 
        # return (log(val)/10) 


def get_inputs(venue):
	inputs = []
        cat_inputs = [0, 0, 0, 0, 0, 0, 0, 0, 0]  

	inputs.append(venue['stats']['checkinsCount'])
	inputs.append(venue['hereNow']['count'])
	inputs.append(venue['stats']['tipCount'])
        inputs.append(int(venue['verified']))
        try:
            category = venue['categories'][0]['parents'][0]
            print venue['categories'][0]['parents'][0]
        except:
            print 'no category for '
            print venue
            category= 'none'
        if category in category_list:
            cat_inputs[category_list.index(category)]=1
            print 'it has a category ' + category
            print cat_inputs
            cat_inputs.extend([0]) #represents it not NOT having a category
        else:
            cat_inputs.extend([1]) # there was no category, this is the tenth option, must extend with a 0 above
        # usersCount (regulars?)
        # friends here
        # number of photos    
        # categories
        inputs = map(scale, inputs)        
        inputs.extend(cat_inputs) # I was scaling these, but shouldn't have been
        # print inputs
        return(inputs)



