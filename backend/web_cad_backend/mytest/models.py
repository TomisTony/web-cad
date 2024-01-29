from django.db import models

# Create your models here.
class Operation(models.Model):
    id = models.AutoField(primary_key=True)
    project_id = models.IntegerField()
    type = models.CharField(max_length=50)
    operator = models.CharField(max_length=50)
    time = models.DateTimeField(auto_now_add=True)
    data = models.TextField(null=True) # 前端请求传入的数据，用二进制序列化保存
    brcad = models.TextField()
    topods_shape = models.BinaryField()

class Project(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    description = models.TextField()
    create_time = models.DateTimeField(auto_now_add=True)
    owner = models.CharField(max_length=50)
    operation_history_ids = models.TextField() # 用序列化 json 字符串保存操作历史记录的 id 数组
    
    
    
