package com.search.service;

import com.search.constant.Role;
import com.search.constant.SpaceCategory;
import com.search.constant.SpaceStatus;
import com.search.entity.Member;
import com.search.entity.Space;
import com.search.entity.SpaceImg;
import com.search.repository.MemberRepository;
import com.search.repository.SpaceImgRepository;
import com.search.repository.SpaceRepository;
import net.datafaker.Faker;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Rollback;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;

@SpringBootTest
@Rollback(false)
class DummyDataInsertTest {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private SpaceRepository spaceRepository;

    @Autowired
    private SpaceImgRepository spaceImgRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final Faker faker = new Faker(new Locale("ko"));
    private final Random random = new Random();

    @Test
    @DisplayName("공간 + 이미지 + 호스트 더미데이터 생성")
    void createDummyData() {

        // 중복 생성 방지
        if (spaceRepository.count() > 0) {
            System.out.println("이미 공간 더미데이터가 존재합니다.");
            return;
        }

        List<Member> hosts = createHostMembers(10);
        SpaceCategory[] categories = SpaceCategory.values();

        for (int i = 1; i <= 100; i++) {
            Member host = hosts.get(random.nextInt(hosts.size()));
            SpaceCategory category = categories[random.nextInt(categories.length)];

            Space space = new Space();
            space.setSpaceName(generateSpaceName(category));
            space.setPrice(generatePrice());
            space.setSpaceDetail(generateSpaceDetailHtml());
            space.setSpaceStatus(generateSpaceStatus());
            space.setCategory(category);
            space.setAddress(generateAddress());
            space.setDetailAddress(faker.address().buildingNumber() + "호");
            space.setMaxCapacity(random.nextInt(20) + 4); // 4~23명
            space.setContactPhone(generatePhoneNumber());
            space.setOpenTime(LocalTime.of(random.nextInt(3) + 8, 0)); // 08:00~10:00 사이 오픈
            space.setCloseTime(LocalTime.of(random.nextInt(4) + 20, 0)); // 20:00~23:00 사이 마감
            space.setNotice("이용 중 기물 파손 시 비용이 청구될 수 있습니다.\n실내 취식은 간단한 음료만 가능합니다.");
            space.setRefundPolicy("이용 7일 전: 100% 환불\n이용 3일 전: 50% 환불\n이용 당일: 환불 불가");
            space.setParkingAvailable(random.nextBoolean());
            space.setWifiAvailable(true);
            space.setHost(host);

            Space savedSpace = spaceRepository.save(space);

            createSpaceImages(savedSpace);
        }

        System.out.println("더미데이터 생성 완료");
    }

    /**
     * 호스트 회원 생성
     */
    private List<Member> createHostMembers(int count) {
        List<Member> hosts = new ArrayList<>();

        for (int i = 1; i <= count; i++) {
            final int index = i;
            String email = "host" + index + "@test.com";

            Member host = memberRepository.findByEmail(email).orElseGet(() -> {
                Member m = new Member();
                m.setName("호스트" + index);
                m.setEmail(email);
                m.setPassword(passwordEncoder.encode("1234"));
                m.setAddress(generateAddress());
                m.setPhoneNumber(generatePhoneNumber());
                m.setPicture(generateProfileImage(index));
                m.setRole(Role.HOST);
                m.setProvider(null);
                m.setProviderId(null);
                return memberRepository.save(m);
            });

            hosts.add(host);
        }

        return hosts;
    }

    /**
     * 공간 이미지 3~5장 생성
     */
    private void createSpaceImages(Space space) {
        int imageCount = random.nextInt(3) + 3; // 3~5장

        for (int i = 0; i < imageCount; i++) {
            SpaceImg spaceImg = new SpaceImg();
            spaceImg.setSpace(space);

            String sampleFileName = getSampleImageFileName(i);
            String imgUrl = "/images/space/" + sampleFileName;

            spaceImg.setOriImgName(sampleFileName);
            spaceImg.setImgName("space_" + space.getId() + "_" + (i + 1) + ".jpg");
            spaceImg.setImgUrl(imgUrl);
            spaceImg.setRepimgYn(i == 0 ? "Y" : "N");

            spaceImgRepository.save(spaceImg);
        }
    }

    /**
     * 공간명 생성 (카테고리별 특화)
     */
    private String generateSpaceName(SpaceCategory category) {
        String[] regions = {"강남", "홍대", "성수", "잠실", "건대", "신촌", "합정", "을지로", "판교", "해운대"};
        String[] concepts = {"모던", "감성", "프리미엄", "화이트", "루프탑", "빈티지", "아늑한", "대형"};
        
        String categoryName = switch (category) {
            case MEETING_ROOM -> "회의실";
            case STUDY_ROOM -> "스터디룸";
            case PARTY_ROOM -> "파티룸";
            case STUDIO -> "스튜디오";
            case PRACTICE_ROOM -> "연습실";
            case SEMINAR_ROOM -> "세미나실";
            case KITCHEN -> "공유주방";
            case WORKROOM -> "작업실";
        };

        return regions[random.nextInt(regions.length)] + " "
                + concepts[random.nextInt(concepts.length)] + " "
                + categoryName;
    }

    /**
     * 공간 가격 생성
     */
    private int generatePrice() {
        int[] prices = {20000, 30000, 40000, 50000, 70000, 100000, 120000, 150000, 200000};
        return prices[random.nextInt(prices.length)];
    }

    /**
     * 공간 상태 생성
     */
    private SpaceStatus generateSpaceStatus() {
        int n = random.nextInt(100);
        if (n < 80) {
            return SpaceStatus.AVAILABLE;
        } else {
            return SpaceStatus.UNAVAILABLE;
        }
    }

    /**
     * Quill HTML 상세설명 생성
     */
    private String generateSpaceDetailHtml() {
        String intro = faker.lorem().sentence(12);
        String desc1 = faker.lorem().sentence(10);
        String desc2 = faker.lorem().sentence(9);

        String[] options = {
                "와이파이 제공", "주차 가능", "빔프로젝터 구비", "화이트보드 제공",
                "음향장비 사용 가능", "냉난방 완비", "테이블/의자 구비", "정수기 사용 가능"
        };

        StringBuilder optionList = new StringBuilder();
        int optionCount = random.nextInt(4) + 3; // 3~6개
        for (int i = 0; i < optionCount; i++) {
            optionList.append("<li>")
                    .append(options[random.nextInt(options.length)])
                    .append("</li>");
        }

        return """
                <h2>공간 소개</h2>
                <p>%s</p>
                <p>%s</p>
                <h3>이용 안내</h3>
                <p>%s</p>
                <ul>
                    %s
                </ul>
                <p><strong>주의사항</strong></p>
                <p>실내 흡연 금지 / 반려동물 동반 여부는 사전 문의 / 이용시간 엄수 부탁드립니다.</p>
                """.formatted(intro, desc1, desc2, optionList.toString());
    }

    /**
     * 주소 생성
     */
    private String generateAddress() {
        String[] cities = {"서울특별시", "부산광역시", "인천광역시", "성남시", "수원시"};
        String[] districts = {"강남구", "마포구", "송파구", "성동구", "해운대구", "분당구", "영통구"};
        String[] streets = {"테헤란로", "양화로", "올림픽로", "성수이로", "센텀중앙로", "판교역로"};

        return cities[random.nextInt(cities.length)] + " "
                + districts[random.nextInt(districts.length)] + " "
                + streets[random.nextInt(streets.length)] + " "
                + (random.nextInt(200) + 1);
    }

    /**
     * 전화번호 생성
     */
    private String generatePhoneNumber() {
        return "010-" + (1000 + random.nextInt(9000)) + "-" + (1000 + random.nextInt(9000));
    }

    /**
     * 프로필 이미지
     */
    private String generateProfileImage(int index) {
        return "/images/profile/profile" + ((index % 5) + 1) + ".jpg";
    }

    /**
     * 공간 샘플 이미지명
     */
    private String getSampleImageFileName(int index) {
        String[] sampleImages = {
                "sample1.jpg",
                "sample2.jpg",
                "sample3.jpg",
                "sample4.jpg",
                "sample5.jpg"
        };
        return sampleImages[index % sampleImages.length];
    }
}
