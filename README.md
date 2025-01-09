Node

## 1. 基础

是一个 js 的运行环境，v8 + c++(提供浏览器没有的特性)
不是编程语言、也不是框架

### 特性：

#### 异步

高扩展性，即不用很多硬件设备（线程）即可处理多客户请求（I/O）的场景  
数据密集型、及时响应  
事件队列

#### 单线程

不适合计算密集型的场景，如图片渲染，这种需要 CPU 进行大量运算，但操作文件和网络很少  
当线程提供运算服务时，其他请求就需要等待了
