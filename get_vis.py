
from pyfann import libfann
import sys

# print sys.argv

# print 'helllllllllllllllllo'

ann = libfann.neural_net()
ann.create_from_file(sys.argv[1])
ann.print_connections()


