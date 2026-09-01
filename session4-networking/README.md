# Networking Commands and Outputs

**`hostname`** — shows my computer's hostname

**`ip a`** — shows network interfaces, IP addresses, MAC addressess and their status

![hostname && ip a](./Outputs/networking_output_1.png)

**`ifconfig`** — shows network interface information similar to "ip a"

![ifconfig](./Outputs/networking_output_2.png)

**`ping scaler.com`** — continuously checks whether scaler.com is reachable and measures response time

**`ping -c 5 scaler.com`** — sends exactly 5 ping packets to scaler.com

![ping](./Outputs/networking_output_3.png)

**`hostname -i`** — shows the ip address associated with my hostname

**`ip route`** — shows my routing table, including the default gateway

![ip](./Outputs/networking_output_4.png)

**`curl scaler.com`** — makes an HTTP request and displays the response/content from the website

**`curl -I scaler.com`** — shows only the website's HTTP headers

![curl](./Outputs/networking_output_5.png)

**`ss -tuln`** — shows listening TCP/UDP ports on my machine

![ss](./Outputs/networking_output_6.png)

**`traceroute scaler.com`** — shows the network hops/routers my packets pass through to reach github

![traceroute](./Outputs/networking_output_7.png)
