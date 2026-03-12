package com.search.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "space_img")
@Getter
@Setter
public class SpaceImg extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "space_img_id")
    private Long id;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    private String imgName; // 고유 파일명
    private String oriImgName; // 원본 파일명
    private String imgUrl; // 이미지 조회 경로
    private String repimgYn; // 대표 이미지 여부 (Y/N)

    public static final String REP_YES = "Y";
    public static final String REP_NO = "N";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "space_id")
    private Space space; // 어떤 공간의 이미지인지 연결

    public void updateSpaceImg(String oriImgName, String imgName, String imgUrl) {
        this.oriImgName = oriImgName;
        this.imgName = imgName;
        this.imgUrl = imgUrl;
    }

    public void updateMeta(boolean representative, int sortOrder) {
        this.repimgYn = representative ? "Y" : "N";
        this.sortOrder = sortOrder;
    }
}
