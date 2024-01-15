from django.db import models

# Create your models here.
class Operation(models.Model):
    id = models.AutoField(primary_key=True)
    type = models.CharField(max_length=50)
    brcad = models.TextField()
    topods_shape = models.BinaryField()
    
    
