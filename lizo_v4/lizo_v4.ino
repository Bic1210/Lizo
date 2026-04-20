/*
 * ============================================
 *  Lizo v4.0 - 治愈系蜥蜴陪伴机器人
 *  修改版：CMD:HAPPY 强制显示 >_< hehe~
 * ============================================
 */

#include <Servo.h>
#include <LiquidCrystal.h>

// ========== LCD不动 ==========
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

// ========== 其他引脚 ==========
#define SERVO_PIN    9
#define MOTOR_PIN    10
#define BUZZER_PIN   6
#define TRIG_PIN     7
#define ECHO_PIN     8
#define TOUCH1_PIN   A1
#define TOUCH2_PIN   A2
#define POT_PIN      A0

// ========== 状态 ==========
enum State {
  SLEEPING, WAKING, IDLE,
  TOUCHED, LONG_TOUCHED,
  LISTENING, SPEAKING
};

State curState = IDLE;
State lastDispState = SLEEPING;
Servo breathServo;

// 呼吸
int breathAngle = 90, breathDir = 1;
unsigned long lastBreathMs = 0;

// 心跳(非阻塞)
unsigned long heartStart = 0;
int heartPhase = 0;

// 超声波
unsigned long lastDistMs = 0;
float curDist = 999;

// 触摸
bool wasTouched = false;
unsigned long touchStart = 0;

// 蜂鸣器(非阻塞)
struct TN { int f; int d; };
TN tQ[5]; int tCnt=0, tIdx=0;
unsigned long tMs=0; bool tBusy=false;

// 唤醒
unsigned long wakeMs = 0;

// 串口
String sBuf = "";

// 用于强制显示 HAPPY 表情后恢复
unsigned long happyDisplayUntil = 0;

// ========== LCD自定义字符 ==========
byte chrHeart[8] = {0,10,31,31,31,14,4,0};
byte chrNote[8]  = {4,6,5,4,4,28,28,0};
byte chrZzz[8]   = {31,2,4,8,31,0,6,6};

// ========== 非阻塞蜂鸣器 ==========
void playT(TN* n, int c) {
  for(int i=0;i<c&&i<5;i++) tQ[i]=n[i];
  tCnt=c; tIdx=0; tMs=millis(); tBusy=true;
  if(tQ[0].f>0) tone(BUZZER_PIN,tQ[0].f,tQ[0].d);
}
void updT() {
  if(!tBusy) return;
  if(millis()-tMs>=(unsigned long)tQ[tIdx].d+20){
    tIdx++;
    if(tIdx>=tCnt){tBusy=false;noTone(BUZZER_PIN);return;}
    tMs=millis();
    if(tQ[tIdx].f>0) tone(BUZZER_PIN,tQ[tIdx].f,tQ[tIdx].d);
  }
}
void sndWake()  {TN n[]={{800,80},{1200,80}};playT(n,2);}
void sndTouch() {TN n[]={{1000,60},{1300,60}};playT(n,2);}
void sndLove()  {TN n[]={{800,80},{1000,80},{1200,120}};playT(n,3);}
void sndSleep() {TN n[]={{300,200}};playT(n,1);}
void sndBoot()  {TN n[]={{1000,80},{1500,80},{2000,120}};playT(n,3);}

// ========== LCD表情 ==========
void showHappyFace() {
  lcd.clear();
  lcd.print("  >_<  ");
  lcd.write(byte(0));
  lcd.setCursor(0, 1);
  lcd.print("  hehe~");
  lcd.write(byte(0));
}

void showFace() {
  // 如果正在强制显示 HAPPY 表情，跳过状态机更新
  if (millis() < happyDisplayUntil) {
    return;
  }
  
  if(curState == lastDispState) return;
  lastDispState = curState;
  lcd.clear();
  lcd.setCursor(0,0);
  
  switch(curState) {
    case SLEEPING:
      lcd.print("  -_- ");
      lcd.write(byte(2)); lcd.write(byte(2));
      lcd.setCursor(0,1);
      lcd.print("  sleeping...");
      break;
    case WAKING:
      lcd.print("  O_O  ?!");
      lcd.setCursor(0,1);
      lcd.print("  who's there?");
      break;
    case IDLE:
      lcd.print("  ^_^  ");
      lcd.write(byte(0));
      lcd.setCursor(0,1);
      lcd.print("  hello~");
      break;
    case TOUCHED:
      lcd.print("  >_<  ");
      lcd.write(byte(0));
      lcd.setCursor(0,1);
      lcd.print("  hehe~");
      break;
    case LONG_TOUCHED:
      lcd.write(byte(0));lcd.print(" ");
      lcd.write(byte(0));lcd.print("_");
      lcd.write(byte(0));lcd.print(" ");
      lcd.write(byte(0));
      lcd.setCursor(0,1);
      lcd.print("  love you! ");
      lcd.write(byte(0));
      break;
    case LISTENING:
      lcd.print("  o_o  ");
      lcd.write(byte(1));
      lcd.setCursor(0,1);
      lcd.print("  listening...");
      break;
    case SPEAKING:
      lcd.print("  ^o^  ");
      lcd.write(byte(1));
      lcd.setCursor(0,1);
      lcd.write(byte(1));
      lcd.print(" talking... ");
      lcd.write(byte(1));
      break;
  }
}

// ========== 超声波 ==========
float readDist() {
  digitalWrite(TRIG_PIN,LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN,HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN,LOW);
  long d=pulseIn(ECHO_PIN,HIGH,25000);
  if(d==0) return 999.0;
  return d*0.034/2.0;
}

// ========== 呼吸 ==========
void updBreath() {
  unsigned long now=millis();
  int spd, bMin, bMax;
  
  switch(curState){
    case SLEEPING:     spd=80; bMin=85; bMax=95; break;
    case TOUCHED:
    case LONG_TOUCHED: spd=25; bMin=75; bMax=105; break;
    case SPEAKING:     spd=30; bMin=78; bMax=102; break;
    default:           spd=45; bMin=80; bMax=100; break;
  }
  
  // 电位器微调
  int pot=analogRead(POT_PIN);
  spd+=map(pot,0,1023,-15,15);
  spd=constrain(spd,10,100);
  
  if(now-lastBreathMs<(unsigned long)spd) return;
  lastBreathMs=now;
  
  breathAngle+=breathDir;
  if(breathAngle>=bMax) breathDir=-1;
  if(breathAngle<=bMin) breathDir=1;
  breathAngle=constrain(breathAngle,bMin,bMax);
  breathServo.write(breathAngle);
}

// ========== 心跳 (双跳节奏) ==========
void updHeart() {
  if(curState==SLEEPING){analogWrite(MOTOR_PIN,0);return;}
  
  unsigned long now=millis();
  int pwr, intv;
  
  switch(curState){
    case TOUCHED:
    case LONG_TOUCHED: pwr=200; intv=500; break;
    case LISTENING:    pwr=150; intv=700; break;
    default:           pwr=130; intv=900; break;
  }
  
  int pot=analogRead(POT_PIN);
  intv+=map(pot,0,1023,200,-200);
  intv=constrain(intv,300,1500);
  
  unsigned long el=now-heartStart;
  
  switch(heartPhase){
    case 0: // 第一跳
      analogWrite(MOTOR_PIN,pwr);
      if(el>=70){heartPhase=1;heartStart=now;analogWrite(MOTOR_PIN,0);}
      break;
    case 1: // 短停
      if(el>=120){heartPhase=2;heartStart=now;}
      break;
    case 2: // 第二跳(弱)
      analogWrite(MOTOR_PIN,pwr*6/10);
      if(el>=50){heartPhase=3;heartStart=now;analogWrite(MOTOR_PIN,0);}
      break;
    case 3: // 长停
      if(el>=(unsigned long)(intv-240)){heartPhase=0;heartStart=now;}
      break;
  }
}

// ========== 触摸 ==========
void updTouch() {
  bool t1=analogRead(TOUCH1_PIN)>500;
  bool t2=analogRead(TOUCH2_PIN)>500;
  bool t=t1||t2;
  
  if(t&&!wasTouched){
    wasTouched=true; touchStart=millis();
    curState=TOUCHED; sndTouch();
    Serial.println("EVENT:TOUCH");
  }
  else if(t&&wasTouched){
    if(millis()-touchStart>3000 && curState!=LONG_TOUCHED){
      curState=LONG_TOUCHED; sndLove();
      Serial.println("EVENT:LOVE");
    }
  }
  else if(!t&&wasTouched){
    wasTouched=false; curState=IDLE;
    Serial.println("EVENT:TOUCH_END");
  }
}

// ========== 超声波接近 ==========
void updProx() {
  unsigned long now=millis();
  if(now-lastDistMs<300) return;
  lastDistMs=now;
  curDist=readDist();
  
  if(curState==TOUCHED||curState==LONG_TOUCHED) return;
  if(curState==LISTENING||curState==SPEAKING) return;
  
  if(curDist>2 && curDist<30){
    if(curState==SLEEPING){
      curState=WAKING; wakeMs=millis();
      sndWake(); Serial.println("EVENT:WAKE");
    }
  }
  else if(curDist>=80){
    if(curState!=SLEEPING){
      curState=SLEEPING; sndSleep();
      Serial.println("EVENT:SLEEP");
    }
  }
  else {
    if(curState==WAKING||curState==SLEEPING) curState=IDLE;
  }
}

void updWake() {
  if(curState==WAKING && millis()-wakeMs>1500) curState=IDLE;
}

// ========== 树莓派串口 ==========
void updSerial() {
  while(Serial.available()){
    char c=Serial.read();
    if(c=='\n'){
      sBuf.trim();
      if(sBuf=="CMD:LISTEN_START"){curState=LISTENING;breathServo.write(100);}
      else if(sBuf=="CMD:LISTEN_STOP"){curState=IDLE;}
      else if(sBuf=="CMD:SPEAK_START"){curState=SPEAKING;}
      else if(sBuf=="CMD:SPEAK_STOP"){curState=IDLE;}
      else if(sBuf=="CMD:HAPPY"){
        curState=TOUCHED;
        sndTouch();
        // 强制显示 >_< hehe~
        showHappyFace();
        happyDisplayUntil = millis() + 800;  // 显示 0.8 秒
      }
      else if(sBuf=="CMD:LOVE"){curState=LONG_TOUCHED;sndLove();}
      Serial.print("ACK:");Serial.println(sBuf);
      sBuf="";
    } else sBuf+=c;
  }
}

// ========== DEBUG ==========
unsigned long lastDbg=0;
void dbg() {
  if(millis()-lastDbg<2000) return;
  lastDbg=millis();
  Serial.print("S:");
  const char* names[]={"SLEEP","WAKE","IDLE","TOUCH","LOVE","LISTEN","SPEAK"};
  Serial.print(names[curState]);
  Serial.print(" D:"); Serial.print(curDist,0);
  Serial.print("cm B:"); Serial.println(breathAngle);
}

// ========== SETUP ==========
void setup() {
  Serial.begin(9600);
  
  pinMode(MOTOR_PIN,OUTPUT);
  pinMode(BUZZER_PIN,OUTPUT);
  pinMode(TOUCH1_PIN,INPUT);
  pinMode(TOUCH2_PIN,INPUT);
  pinMode(TRIG_PIN,OUTPUT);
  pinMode(ECHO_PIN,INPUT);
  
  analogWrite(MOTOR_PIN,0);
  breathServo.attach(SERVO_PIN);
  breathServo.write(90);
  
  lcd.begin(16,2);
  lcd.createChar(0,chrHeart);
  lcd.createChar(1,chrNote);
  lcd.createChar(2,chrZzz);
  
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print(" Lizo v4.0 ");
  lcd.write(byte(0));
  lcd.setCursor(0,1);
  lcd.print(" starting...");
  
  sndBoot();
  delay(1500);
  
  curState=IDLE;
  lastDispState=SLEEPING;
  heartStart=millis();
  
  Serial.println("=== Lizo v4.0 ===");
}

// ========== LOOP ==========
void loop() {
  updBreath();
  updHeart();
  updTouch();
  updProx();
  updWake();
  updT();
  showFace();
  updSerial();
  dbg();
  delay(5);
}