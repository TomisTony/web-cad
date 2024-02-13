from django.db import models

# Create your models here.
class Operation(models.Model):
    id = models.AutoField(primary_key=True)
    project_id = models.IntegerField()
    type = models.CharField(max_length=50)
    operator_id = models.IntegerField()
    time = models.IntegerField()
    data = models.TextField(null=True) # 前端请求传入的数据，用二进制序列化保存
    brcad = models.TextField()
    topods_shape = models.BinaryField()

class Project(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    description = models.TextField()
    create_time = models.IntegerField()
    owner_id = models.IntegerField()
    editors = models.TextField() # 用序列化 json 字符串保存编辑者的 id 数组
    operation_history_ids = models.TextField() # 用序列化 json 字符串保存操作历史记录的 id 数组
    
    
    
